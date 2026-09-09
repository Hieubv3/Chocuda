import React, { useState, useEffect, useCallback } from 'react';
import { DeveloperUnit, F1Agent, DeveloperPolicy, DeveloperInstallment, DeveloperBank, DeveloperFloorplan, DEVELOPER_UNIT_STATUS_LABELS, DeveloperUnitStatus } from '../types';
import { Building2, MapPin, Download, Upload, FileSpreadsheet, Plus, Trash2, Check, RefreshCw, X, Save, Search, Filter, Landmark, CalendarClock, ClipboardList, LayoutDashboard, Import, Map as MapIcon, Home, FileText, Share2 } from 'lucide-react';

// ============================================================
// MẶT BẰNG & BẢNG HÀNG CHỦ ĐẦU TƯ — Admin Section (9 phân hệ)
// ============================================================

interface DeveloperUnitsAdminProps {
  subTab: string;
  setSubTab: (t: string) => void;
}

const STATUS_BADGE: Record<DeveloperUnitStatus, string> = {
  conhang: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
  dabooking: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  dacoc: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
  daban: 'bg-slate-500/15 text-slate-400 border-slate-500/40',
  thuhoi: 'bg-rose-500/15 text-rose-400 border-rose-500/40'
};

const STATUS_DOT: Record<DeveloperUnitStatus, string> = {
  conhang: '#10b981',
  dabooking: '#f59e0b',
  dacoc: '#0ea5e9',
  daban: '#94a3b8',
  thuhoi: '#f43f5e'
};

const SUB_CONFIG: Record<string, { name: string; prefix: string; tier: 'cao' | 'thap' }> = {
  'op2-cha-la': { name: 'Phân khu Chà Là', prefix: 'CL', tier: 'thap' },
  'op2-co-xanh': { name: 'Phân khu Cọ Xanh', prefix: 'CX', tier: 'thap' },
  'op2-hai-tang': { name: 'Phân khu Hải Tăng', prefix: 'HA', tier: 'cao' },
  'op2-san-ho': { name: 'Phân khu San Hô', prefix: 'SH', tier: 'thap' },
  'op1-san-ho': { name: 'Phân khu San Hô', prefix: 'SH', tier: 'thap' },
  'op1-ngoc-trai': { name: 'Phân khu Ngọc Trai', prefix: 'NT', tier: 'thap' }
};

const PROJECTS: Record<string, { name: string; subs: string[] }> = {
  'ocean-park-2': { name: 'Vinhomes Ocean Park 2 - The Empire', subs: ['op2-cha-la', 'op2-co-xanh', 'op2-hai-tang', 'op2-san-ho'] },
  'ocean-park-1': { name: 'Vinhomes Ocean Park 1 - Gia Lâm', subs: ['op1-san-ho', 'op1-ngoc-trai'] }
};

const tierLabel = (t: string) => t === 'cao' ? '🏢 Cao tầng' : '🏘️ Thấp tầng';

export const DeveloperUnitsAdmin: React.FC<DeveloperUnitsAdminProps> = ({ subTab, setSubTab }) => {
  const [units, setUnits] = useState<DeveloperUnit[]>([]);
  const [agents, setAgents] = useState<F1Agent[]>([]);
  const [policies, setPolicies] = useState<DeveloperPolicy[]>([]);
  const [installments, setInstallments] = useState<DeveloperInstallment[]>([]);
  const [banks, setBanks] = useState<DeveloperBank[]>([]);
  const [floorplans, setFloorplans] = useState<DeveloperFloorplan[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Mặt Bằng state
  const [currentProject, setCurrentProject] = useState('ocean-park-2');
  const [currentTier, setCurrentTier] = useState<'cao' | 'thap'>('thap');
  const [currentSub, setCurrentSub] = useState('op2-cha-la');
  const [selectedUnit, setSelectedUnit] = useState<DeveloperUnit | null>(null);
  const [tabCdtF1, setTabCdtF1] = useState<'cdt' | 'f1'>('cdt');

  // Danh sách căn filters
  const [propSearch, setPropSearch] = useState('');
  const [propStatusFilter, setPropStatusFilter] = useState('all');
  const [propTypeFilter, setPropTypeFilter] = useState('all');
  const [propTierFilter, setPropTierFilter] = useState('all');

  // Sơ đồ MB state
  const [fpImage, setFpImage] = useState('/images/demo/project-tower.jpg');
  const [pinMode, setPinMode] = useState(false);
  const [editingUnit, setEditingUnit] = useState<DeveloperUnit | null>(null);

  // Chính sách form
  const [policyForm, setPolicyForm] = useState<any>({});

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [u, a, p, i, b, f] = await Promise.all([
        fetch('/api/developer-units').then(r => r.json()),
        fetch('/api/developer-f1-agents').then(r => r.json()),
        fetch('/api/developer-policies').then(r => r.json()),
        fetch('/api/developer-installments').then(r => r.json()),
        fetch('/api/developer-banks').then(r => r.json()),
        fetch('/api/developer-floorplans').then(r => r.json())
      ]);
      setUnits(Array.isArray(u) ? u : []);
      setAgents(Array.isArray(a) ? a : []);
      setPolicies(Array.isArray(p) ? p : []);
      setInstallments(Array.isArray(i) ? i : []);
      setBanks(Array.isArray(b) ? b : []);
      setFloorplans(Array.isArray(f) ? f : []);
      const pol = (Array.isArray(p) ? p : []).find((x: DeveloperPolicy) => x.projectId === 'ocean-park-2');
      if (pol) {
        try { setPolicyForm(JSON.parse(pol.content)); } catch { setPolicyForm({}); }
      }
    } catch (e) {
      console.error('Failed to load developer units', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Khi đổi project/tier → chọn phân khu đầu tiên phù hợp
  useEffect(() => {
    const subs = PROJECTS[currentProject].subs.filter(s => SUB_CONFIG[s].tier === currentTier);
    if (subs.length > 0 && !subs.includes(currentSub)) {
      setCurrentSub(subs[0]);
    }
  }, [currentProject, currentTier, currentSub]);

  const currentUnits = units.filter(u => u.subdivisionId === currentSub);
  const cdtUnits = units.filter(u => u.source === 'cdt');
  const f1Units = units.filter(u => u.source === 'f1');

  const stats = (list: DeveloperUnit[]) => {
    const t: Record<string, number> = { conhang: 0, dabooking: 0, dacoc: 0, daban: 0, thuhoi: 0 };
    list.forEach(u => { if (t[u.status] !== undefined) t[u.status]++; });
    return t;
  };
  const st = stats(units);

  const api = async (url: string, method: string, body?: any) => {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    return res.json();
  };

  const updateUnitStatus = async (id: string, status: DeveloperUnitStatus) => {
    await api(`/api/developer-units/${id}/status`, 'POST', { status });
    setUnits(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    showToast(`✅ Đã đổi trạng thái căn thành "${DEVELOPER_UNIT_STATUS_LABELS[status]}"`);
  };

  const approveF1Unit = async (unitId: string, agentId: string) => {
    await api(`/api/developer-f1-agents/${agentId}/approve-unit`, 'POST', { unitId });
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, note: 'approved' } : u));
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, approvedCount: Math.min(a.approvedCount + 1, a.totalCount) } : a));
    showToast('✅ Đã duyệt căn F1 — sẽ hiển thị trên trang web chính');
  };

  const syncAgent = async (agentId: string) => {
    const a = agents.find(x => x.id === agentId);
    if (!a) return;
    showToast(`🔄 Đã đọc quỹ căn của ${a.name} (${a.totalCount} căn)`);
  };

  const saveUnit = async () => {
    if (!editingUnit) return;
    if (editingUnit.id.startsWith('du-') && units.some(u => u.id === editingUnit.id)) {
      await api(`/api/developer-units/${editingUnit.id}`, 'PUT', editingUnit);
    } else {
      await api('/api/developer-units', 'POST', editingUnit);
    }
    setEditingUnit(null);
    setSelectedUnit(null);
    await fetchAll();
    showToast('✅ Đã lưu căn!');
  };

  const deleteUnit = async (id: string) => {
    if (!confirm('Xóa căn này?')) return;
    await api(`/api/developer-units/${id}`, 'DELETE');
    setUnits(prev => prev.filter(u => u.id !== id));
    setSelectedUnit(null);
    showToast('🗑️ Đã xóa căn');
  };

  const savePolicy = async () => {
    const pol = policies.find(x => x.projectId === 'ocean-park-2');
    if (pol) {
      await api(`/api/developer-policies/${pol.id}`, 'PUT', { content: JSON.stringify(policyForm) });
    } else {
      await api('/api/developer-policies', 'POST', { projectId: 'ocean-park-2', title: 'Chính sách bán hàng CĐT', content: JSON.stringify(policyForm) });
    }
    showToast('✅ Đã lưu chính sách!');
  };

  const addInstallment = async () => {
    const name = prompt('Tên đợt:');
    if (!name) return;
    const pct = prompt('Tỷ lệ %:');
    await api('/api/developer-installments', 'POST', { projectId: 'ocean-park-2', name, percent: Number(pct) || 0, dueDate: 'D+24 tháng' });
    await fetchAll();
    showToast('✅ Đã thêm đợt ' + name);
  };

  const removeInstallment = async (id: string) => {
    if (!confirm('Xóa đợt thanh toán này?')) return;
    await api(`/api/developer-installments/${id}`, 'DELETE');
    setInstallments(prev => prev.filter(x => x.id !== id));
    showToast('🗑️ Đã xóa đợt');
  };

  const addBank = async () => {
    const name = prompt('Tên ngân hàng:');
    if (!name) return;
    const rate = prompt('Lãi suất ưu đãi:') || '?';
    await api('/api/developer-banks', 'POST', { projectId: 'ocean-park-2', name, rate, maxLoan: '70%', term: '25 năm', support: 'Hỗ trợ 70% giá trị' });
    await fetchAll();
    showToast('✅ Đã thêm ' + name);
  };

  const removeBank = async (id: string) => {
    const b = banks.find(x => x.id === id);
    if (!b || !confirm('Xóa ngân hàng ' + b.name + '?')) return;
    await api(`/api/developer-banks/${id}`, 'DELETE');
    setBanks(prev => prev.filter(x => x.id !== id));
    showToast('🗑️ Đã xóa ngân hàng');
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ units, agents, policies, installments, banks, floorplans }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bang-hang-cdt-export.json';
    a.click();
    showToast('📤 Đã export JSON');
  };

  const exportCSV = () => {
    const rows = [['Mã căn', 'Phân khu', 'Loại', 'Diện tích', 'Giá (tỷ)', 'Trạng thái', 'Nguồn', 'Tầng']];
    units.forEach(u => {
      rows.push([u.code, SUB_CONFIG[u.subdivisionId]?.name || u.subdivisionId, u.type, String(u.area), String(u.price), DEVELOPER_UNIT_STATUS_LABELS[u.status], u.source === 'cdt' ? 'CĐT' : 'F1', u.floor || '']);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bang-hang-cdt-export.csv';
    a.click();
    showToast('📤 Đã export CSV');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.units)) {
          for (const u of data.units) {
            await api('/api/developer-units', 'POST', u);
          }
          await fetchAll();
          showToast(`📥 Đã import ${data.units.length} căn!`);
        }
      } catch (err) {
        showToast('❌ File JSON không hợp lệ');
      }
    };
    reader.readAsText(file);
  };

  const filteredProps = units.filter(u => {
    const q = propSearch.toLowerCase();
    const matchQ = !q || u.code.toLowerCase().includes(q) || u.type.toLowerCase().includes(q);
    const matchS = propStatusFilter === 'all' || u.status === propStatusFilter;
    const matchT = propTypeFilter === 'all' || u.type === propTypeFilter;
    const matchTier = propTierFilter === 'all' || u.tier === propTierFilter;
    return matchQ && matchS && matchT && matchTier;
  });

  const renderUnitModal = () => {
    if (!selectedUnit && !editingUnit) return null;
    const u = editingUnit || selectedUnit;
    if (!u) return null;
    const set = (patch: Partial<DeveloperUnit>) => {
      if (editingUnit) setEditingUnit({ ...editingUnit, ...patch });
    };
    return (
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setSelectedUnit(null); setEditingUnit(null); }}>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" /> {u.code}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGE[u.status]}`}>{DEVELOPER_UNIT_STATUS_LABELS[u.status]}</span>
            </h3>
            <button onClick={() => { setSelectedUnit(null); setEditingUnit(null); }} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="text-slate-400 font-bold">Mã căn</span>
              <input value={u.code} onChange={e => set({ code: e.target.value })} className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-bold">Loại</span>
              <input value={u.type} onChange={e => set({ type: e.target.value })} className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-bold">Diện tích (m²)</span>
              <input type="number" value={u.area} onChange={e => set({ area: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-bold">Giá (tỷ)</span>
              <input type="number" value={u.price} onChange={e => set({ price: Number(e.target.value), priceDisplay: `${e.target.value} tỷ` })} className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-bold">Trạng thái</span>
              <select value={u.status} onChange={e => set({ status: e.target.value as DeveloperUnitStatus })} className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white">
                {(Object.keys(DEVELOPER_UNIT_STATUS_LABELS) as DeveloperUnitStatus[]).map(s => <option key={s} value={s}>{DEVELOPER_UNIT_STATUS_LABELS[s]}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-bold">Tầng</span>
              <input value={u.floor || ''} onChange={e => set({ floor: e.target.value })} placeholder="Thấp tầng bỏ trống" className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white" />
            </label>
            <label className="space-y-1 col-span-2">
              <span className="text-slate-400 font-bold">Ghi chú</span>
              <input value={u.note || ''} onChange={e => set({ note: e.target.value })} className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white" />
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            {!editingUnit && (
              <>
                <button onClick={() => setEditingUnit({ ...u })} className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl text-xs">✏️ Sửa</button>
                <button onClick={() => deleteUnit(u.id)} className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs">🗑️ Xóa</button>
              </>
            )}
            {editingUnit && (
              <button onClick={saveUnit} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs">💾 Lưu thay đổi</button>
            )}
            <button onClick={() => { setSelectedUnit(null); setEditingUnit(null); }} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-xl text-xs">Đóng</button>
          </div>
        </div>
      </div>
    );
  };

  const renderMatBang = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">MẶT BẰNG & BẢNG HÀNG CĐT</span>
            <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> QUẢN LÝ QUỸ CĂN CHỦ ĐẦU TƯ & ĐẠI LÝ F1
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">Sơ đồ mặt bằng trực quan, cập nhật trạng thái căn theo thời gian thực, duyệt căn từ đại lý F1.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={currentProject} onChange={e => setCurrentProject(e.target.value)} className="px-3 py-2 bg-slate-800 text-white rounded-xl border border-slate-700 text-xs font-bold">
              {Object.keys(PROJECTS).map(p => <option key={p} value={p}>{PROJECTS[p].name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tier toggle + Sub selector */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button onClick={() => setCurrentTier('thap')} className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${currentTier === 'thap' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-300'}`}>🏘️ Thấp tầng</button>
          <button onClick={() => setCurrentTier('cao')} className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${currentTier === 'cao' ? 'bg-sky-600 text-white shadow' : 'text-slate-500 dark:text-slate-300'}`}>🏢 Cao tầng</button>
        </div>
        <select value={currentSub} onChange={e => setCurrentSub(e.target.value)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          {PROJECTS[currentProject].subs.filter(s => SUB_CONFIG[s].tier === currentTier).map(s => (
            <option key={s} value={s}>{SUB_CONFIG[s].name}</option>
          ))}
        </select>
        <span className="text-[10px] font-mono text-slate-400">{tierLabel(currentTier)} · {currentUnits.length} căn</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: 'Tổng căn', value: units.length, color: 'text-white', bg: 'bg-slate-800' },
          { label: 'Còn hàng', value: st.conhang, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
          { label: 'Đã booking', value: st.dabooking, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
          { label: 'Đã cọc', value: st.dacoc, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
          { label: 'Đã bán', value: st.daban, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30' },
          { label: 'Thu hồi', value: st.thuhoi, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' }
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-3 text-center`}>
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-bold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* CĐT / F1 tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button onClick={() => setTabCdtF1('cdt')} className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${tabCdtF1 === 'cdt' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-300'}`}>🏗️ Quỹ Căn CĐT ({cdtUnits.length})</button>
        <button onClick={() => setTabCdtF1('f1')} className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${tabCdtF1 === 'f1' ? 'bg-sky-600 text-white shadow' : 'text-slate-500 dark:text-slate-300'}`}>🤝 Đại Lý F1 ({f1Units.length})</button>
      </div>

      {tabCdtF1 === 'cdt' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Floor plan */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-800 dark:text-white">🗺️ Sơ đồ — {SUB_CONFIG[currentSub]?.name} · {tierLabel(currentTier)}</h3>
              <span className="text-[10px] font-mono text-slate-400">{currentUnits.length} căn</span>
            </div>
            <div className="relative">
              <img src={fpImage} alt="Sơ đồ mặt bằng" className="w-full h-[420px] object-cover" />
              {currentUnits.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnit(u)}
                  title={`${u.code} — ${DEVELOPER_UNIT_STATUS_LABELS[u.status]} — ${u.price} tỷ`}
                  className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 shadow-lg transition hover:scale-125 cursor-pointer ${u.source === 'f1' ? 'border-dashed' : ''}`}
                  style={{ left: `${u.x}%`, top: `${u.y}%`, background: u.source === 'f1' ? (u.status === 'conhang' ? '#3b82f6' : u.status === 'dabooking' ? '#8b5cf6' : '#94a3b8') : STATUS_DOT[u.status], borderColor: u.source === 'f1' ? '#60a5fa' : 'rgba(255,255,255,0.6)' }}
                >
                  {u.code.replace(/^[A-Z]+-/, '').replace('-F1', '')}
                </button>
              ))}
            </div>
            <div className="px-4 py-3 flex flex-wrap gap-3 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Còn hàng</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Booking</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Đã cọc</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Đã bán</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Thu hồi</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> F1</span>
            </div>
          </div>

          {/* Unit table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-800 dark:text-white">📋 Bảng hàng — {SUB_CONFIG[currentSub]?.name} ({currentUnits.length} căn)</h3>
              <button onClick={() => { setEditingUnit({ id: `du-${Date.now()}`, projectId: currentProject, subdivisionId: currentSub, code: `${SUB_CONFIG[currentSub].prefix}-${100 + currentUnits.length + 1}`, type: 'Nhà phố thương mại', area: 90, price: 15, priceDisplay: '15 tỷ', status: 'conhang', source: 'cdt', tier: currentTier, x: 30, y: 30, updatedAt: new Date().toISOString() }); }} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"><Plus className="w-3 h-3" /> Thêm căn</button>
            </div>
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
                  <tr>
                    <th className="text-left px-3 py-2 font-black">Mã</th>
                    <th className="text-left px-3 py-2 font-black">Loại</th>
                    <th className="text-left px-3 py-2 font-black">DT</th>
                    <th className="text-left px-3 py-2 font-black">Giá</th>
                    <th className="text-left px-3 py-2 font-black">Trạng thái</th>
                    <th className="text-left px-3 py-2 font-black">Nguồn</th>
                    <th className="text-left px-3 py-2 font-black">Tầng</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUnits.map(u => (
                    <tr key={u.id} onClick={() => setSelectedUnit(u)} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                      <td className="px-3 py-2 font-black text-slate-800 dark:text-white">{u.code}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-300">{u.type}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-300">{u.area} m²</td>
                      <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200">{u.price} tỷ</td>
                      <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${STATUS_BADGE[u.status]}`}>{DEVELOPER_UNIT_STATUS_LABELS[u.status]}</span></td>
                      <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${u.source === 'cdt' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40' : 'bg-sky-500/10 text-sky-400 border-sky-500/40'}`}>{u.source === 'cdt' ? 'CĐT' : 'F1'}</span></td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-300">{u.floor || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* F1 Agents */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {agents.map(a => (
              <div key={a.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-black text-sm text-slate-800 dark:text-white">🤝 {a.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">📞 {a.phone}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-sky-500/10 text-sky-400 border-sky-500/40">F1</span>
                </div>
                <div className="flex gap-3 text-[10px]">
                  <span className="text-slate-500 dark:text-slate-300">Tổng: <b className="text-white">{a.totalCount}</b></span>
                  <span className="text-slate-500 dark:text-slate-300">Đã duyệt: <b className="text-emerald-400">{a.approvedCount}</b></span>
                  <span className="text-slate-500 dark:text-slate-300">Chờ: <b className="text-amber-400">{a.totalCount - a.approvedCount}</b></span>
                </div>
                <button onClick={() => syncAgent(a.id)} className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer"><RefreshCw className="w-3 h-3" /> Đọc Quỹ Căn</button>
              </div>
            ))}
          </div>

          {/* F1 Units */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-800 dark:text-white">📋 {f1Units.length} căn từ {agents.length} đại lý</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
                  <tr>
                    <th className="text-left px-3 py-2 font-black">Mã</th>
                    <th className="text-left px-3 py-2 font-black">Phân khu</th>
                    <th className="text-left px-3 py-2 font-black">Loại</th>
                    <th className="text-left px-3 py-2 font-black">Đại lý</th>
                    <th className="text-left px-3 py-2 font-black">DT</th>
                    <th className="text-left px-3 py-2 font-black">Giá</th>
                    <th className="text-left px-3 py-2 font-black">Trạng thái</th>
                    <th className="text-left px-3 py-2 font-black">Duyệt</th>
                  </tr>
                </thead>
                <tbody>
                  {f1Units.map(u => {
                    const agent = agents.find(a => a.id === u.agentId);
                    return (
                      <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2 font-black text-slate-800 dark:text-white">{u.code}</td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-300">{SUB_CONFIG[u.subdivisionId]?.name.replace('Phân khu ', '')}</td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-300">{u.type}</td>
                        <td className="px-3 py-2 text-sky-400 font-bold">{agent?.name || '—'}</td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-300">{u.area} m²</td>
                        <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200">{u.price} tỷ</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${STATUS_BADGE[u.status]}`}>{DEVELOPER_UNIT_STATUS_LABELS[u.status]}</span></td>
                        <td className="px-3 py-2">
                          {u.note === 'approved' ? (
                            <span className="text-emerald-400 font-black text-[10px]">✅ Đã duyệt</span>
                          ) : (
                            <button onClick={() => approveF1Unit(u.id, u.agentId || '')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-[10px] cursor-pointer">✓ Duyệt</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white">
        <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">DASHBOARD</span>
        <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2"><LayoutDashboard className="w-5 h-5" /> TỔNG QUAN BẢNG HÀNG CHỦ ĐẦU TƯ</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng quỹ căn', value: units.length, icon: '🏗️', color: 'text-white' },
          { label: 'Còn hàng', value: st.conhang, icon: '🟢', color: 'text-emerald-400' },
          { label: 'Đã bán', value: st.daban, icon: '⚪', color: 'text-slate-400' },
          { label: 'Căn F1 chờ duyệt', value: f1Units.filter(u => u.note !== 'approved').length, icon: '🤝', color: 'text-sky-400' }
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-4">
            <div className="text-2xl">{s.icon}</div>
            <div className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-bold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-4">
          <h3 className="font-black text-sm text-slate-800 dark:text-white mb-3">💰 Chính sách bán hàng</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Cọc</span><b className="text-slate-700 dark:text-slate-200">{policyForm.pDeposit || '—'} VNĐ</b></div>
            <div className="flex justify-between"><span className="text-slate-400">Hoàn lại sau</span><b className="text-slate-700 dark:text-slate-200">{policyForm.refundDays || '—'} ngày</b></div>
            <div className="flex justify-between"><span className="text-slate-400">Vay</span><b className="text-slate-700 dark:text-slate-200">{policyForm.loanRate || '—'} · {policyForm.loanRate2 || '—'}</b></div>
            <div className="flex justify-between"><span className="text-slate-400">Giãn xây</span><b className="text-slate-700 dark:text-slate-200">{policyForm.buildDeposit || '—'} / {policyForm.buildTime || '—'}</b></div>
            <div className="flex justify-between"><span className="text-slate-400">Ghi chú</span><b className="text-slate-500">{policyForm.notes || '—'}</b></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-4">
          <h3 className="font-black text-sm text-slate-800 dark:text-white mb-3">📅 Đợt thanh toán</h3>
          <div className="space-y-2 text-xs">
            {installments.map(x => (
              <div key={x.id} className="flex justify-between"><span className="text-slate-400">{x.name}</span><b className="text-slate-700 dark:text-slate-200">{x.percent}%</b></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderImport = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white">
        <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">IMPORT SHEET</span>
        <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2"><Import className="w-5 h-5" /> NHẬP DỮ LIỆU BẢNG HÀNG TỪ FILE</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-6 text-center space-y-4">
          <FileSpreadsheet className="w-12 h-12 text-emerald-400 mx-auto" />
          <div>
            <h3 className="font-black text-sm text-slate-800 dark:text-white">Import file JSON</h3>
            <p className="text-[10px] text-slate-400 mt-1">File export từ trang này hoặc từ Google Sheets (định dạng JSON có mảng "units")</p>
          </div>
          <label className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs cursor-pointer">
            <Upload className="w-4 h-4" /> Chọn file JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
          </label>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-6 text-center space-y-4">
          <ClipboardList className="w-12 h-12 text-sky-400 mx-auto" />
          <div>
            <h3 className="font-black text-sm text-slate-800 dark:text-white">Hướng dẫn</h3>
            <p className="text-[10px] text-slate-400 mt-1 text-left leading-relaxed">
              1. Export dữ liệu hiện tại (JSON) để lấy mẫu cấu trúc.<br />
              2. Chỉnh sửa trong Google Sheets / Excel.<br />
              3. Export lại thành JSON và import lên đây.<br />
              4. Các căn trùng mã sẽ được thêm mới (không ghi đè).
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSodo = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white">
        <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">SƠ ĐỒ MẶT BẰNG</span>
        <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2"><MapIcon className="w-5 h-5" /> CHỈNH SỬA SƠ ĐỒ & VỊ TRÍ CĂN</h2>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex-1 min-w-[200px] space-y-1">
            <span className="text-[10px] text-slate-400 font-bold">URL ảnh sơ đồ</span>
            <input value={fpImage} onChange={e => setFpImage(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
          </label>
          <button onClick={() => setPinMode(!pinMode)} className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${pinMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            📍 {pinMode ? 'Đang chọn vị trí — click lên sơ đồ' : 'Bật chế độ đặt căn'}
          </button>
        </div>
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <img src={fpImage} alt="Sơ đồ" className="w-full h-[480px] object-cover" />
          {units.filter(u => u.subdivisionId === currentSub).map(u => (
            <button
              key={u.id}
              onClick={() => setSelectedUnit(u)}
              className="absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 shadow-lg hover:scale-125 cursor-pointer"
              style={{ left: `${u.x}%`, top: `${u.y}%`, background: STATUS_DOT[u.status], borderColor: 'rgba(255,255,255,0.6)' }}
            >
              {u.code.replace(/^[A-Z]+-/, '').replace('-F1', '')}
            </button>
          ))}
          {pinMode && (
            <div
              className="absolute inset-0 cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                setEditingUnit({ id: `du-${Date.now()}`, projectId: currentProject, subdivisionId: currentSub, code: `${SUB_CONFIG[currentSub].prefix}-${100 + currentUnits.length + 1}`, type: 'Nhà phố thương mại', area: 90, price: 15, priceDisplay: '15 tỷ', status: 'conhang', source: 'cdt', tier: currentTier, x, y, updatedAt: new Date().toISOString() });
                setPinMode(false);
              }}
            />
          )}
        </div>
        <p className="text-[10px] text-slate-400">Chọn phân khu ở trang Mặt Bằng để chỉnh sửa đúng khu vực. Bật chế độ đặt căn rồi click vào vị trí trên sơ đồ để thêm căn mới.</p>
      </div>
    </div>
  );

  const renderDanhSach = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white">
        <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">DANH SÁCH CĂN</span>
        <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2"><Home className="w-5 h-5" /> TOÀN BỘ QUỸ CĂN ({units.length})</h2>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input value={propSearch} onChange={e => setPropSearch(e.target.value)} placeholder="Tìm mã căn, loại..." className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
          </div>
          <select value={propStatusFilter} onChange={e => setPropStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <option value="all">Tất cả trạng thái</option>
            {(Object.keys(DEVELOPER_UNIT_STATUS_LABELS) as DeveloperUnitStatus[]).map(s => <option key={s} value={s}>{DEVELOPER_UNIT_STATUS_LABELS[s]}</option>)}
          </select>
          <select value={propTierFilter} onChange={e => setPropTierFilter(e.target.value)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <option value="all">Tất cả tầng</option>
            <option value="thap">🏘️ Thấp tầng</option>
            <option value="cao">🏢 Cao tầng</option>
          </select>
          <select value={propTypeFilter} onChange={e => setPropTypeFilter(e.target.value)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <option value="all">Tất cả loại</option>
            <option>Nhà phố thương mại</option>
            <option>Shophouse</option>
            <option>Nhà liền kề</option>
            <option>Biệt thự đơn lập</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
              <tr>
                <th className="text-left px-3 py-2 font-black">Mã</th>
                <th className="text-left px-3 py-2 font-black">Phân khu</th>
                <th className="text-left px-3 py-2 font-black">Tầng</th>
                <th className="text-left px-3 py-2 font-black">Loại</th>
                <th className="text-left px-3 py-2 font-black">DT</th>
                <th className="text-left px-3 py-2 font-black">Giá</th>
                <th className="text-left px-3 py-2 font-black">Trạng thái</th>
                <th className="text-left px-3 py-2 font-black">Nguồn</th>
                <th className="text-left px-3 py-2 font-black">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProps.map(u => (
                <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2 font-black text-slate-800 dark:text-white">{u.code}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-300">{SUB_CONFIG[u.subdivisionId]?.name.replace('Phân khu ', '') || u.subdivisionId}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${u.tier === 'cao' ? 'bg-sky-500/10 text-sky-400 border-sky-500/40' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'}`}>{u.tier === 'cao' ? '🏢 Cao' : '🏘️ Thấp'}</span></td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-300">{u.type}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-300">{u.area} m²</td>
                  <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200">{u.price} tỷ</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${STATUS_BADGE[u.status]}`}>{DEVELOPER_UNIT_STATUS_LABELS[u.status]}</span></td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${u.source === 'cdt' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40' : 'bg-sky-500/10 text-sky-400 border-sky-500/40'}`}>{u.source === 'cdt' ? 'CĐT' : 'F1'}</span></td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <select value={u.status} onChange={e => updateUnitStatus(u.id, e.target.value as DeveloperUnitStatus)} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 text-[9px] font-bold">
                        {(Object.keys(DEVELOPER_UNIT_STATUS_LABELS) as DeveloperUnitStatus[]).map(s => <option key={s} value={s}>{DEVELOPER_UNIT_STATUS_LABELS[s]}</option>)}
                      </select>
                      <button onClick={() => setSelectedUnit(u)} className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[9px] font-black cursor-pointer">✏️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderChinhSach = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white">
        <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">CHÍNH SÁCH BÁN HÀNG</span>
        <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2"><FileText className="w-5 h-5" /> CẤU HÌNH CHÍNH SÁCH CĐT</h2>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'pDeposit', label: '💰 Tiền cọc (VNĐ)' },
            { key: 'refundDays', label: '⏱️ Hoàn lại sau (ngày)' },
            { key: 'bankInfo', label: '🏦 Thông tin tài khoản' },
            { key: 'disc1', label: '📉 Chiết khấu 1' },
            { key: 'disc2', label: '📉 Chiết khấu 2' },
            { key: 'disc3', label: '📉 Chiết khấu 3' },
            { key: 'loanRate', label: '🏦 Tỷ lệ vay' },
            { key: 'loanRate2', label: '🏦 Lãi suất ưu đãi' },
            { key: 'loanTerm', label: '⏳ Kỳ hạn vay' },
            { key: 'bankList', label: '🏛️ Danh sách ngân hàng' },
            { key: 'buildDeposit', label: '🏗️ Cọc xây dựng' },
            { key: 'buildTime', label: '🏗️ Thời gian giãn xây' },
            { key: 'loyalty', label: '🎁 Ưu đãi khách hàng thân thiết' },
            { key: 'notes', label: '📝 Ghi chú' }
          ].map(f => (
            <label key={f.key} className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold">{f.label}</span>
              <input value={policyForm[f.key] || ''} onChange={e => setPolicyForm({ ...policyForm, [f.key]: e.target.value })} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
            </label>
          ))}
        </div>
        <button onClick={savePolicy} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer"><Save className="w-4 h-4" /> Lưu chính sách</button>
      </div>
    </div>
  );

  const renderDotTT = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white">
        <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">ĐỢT THANH TOÁN</span>
        <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2"><CalendarClock className="w-5 h-5" /> LỊCH THANH TOÁN THEO TIẾN ĐỘ</h2>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-800 dark:text-white">📅 Các đợt thanh toán ({installments.length})</h3>
          <button onClick={addInstallment} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer"><Plus className="w-3 h-3" /> Thêm đợt</button>
        </div>
        <div className="space-y-2">
          {installments.map(x => (
            <div key={x.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="font-black text-xs text-slate-800 dark:text-white">{x.name}</div>
                <div className="text-[10px] text-slate-400">{x.dueDate}</div>
              </div>
              <div className="flex items-center gap-3">
                <b className="text-emerald-500 text-sm">{x.percent}%</b>
                <button onClick={() => removeInstallment(x.id)} className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNganHang = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white">
        <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">NGÂN HÀNG</span>
        <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2"><Landmark className="w-5 h-5" /> NGÂN HÀNG HỖ TRỢ VAY</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {banks.map(b => (
          <div key={b.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-black text-sm text-slate-800 dark:text-white">🏦 {b.name}</div>
              <button onClick={() => removeBank(b.id)} className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div className="text-[10px] space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-400">Lãi suất ưu đãi</span><b className="text-slate-700 dark:text-slate-200">{b.rate}</b></div>
              <div className="flex justify-between"><span className="text-slate-400">Hỗ trợ</span><b className="text-slate-700 dark:text-slate-200">{b.support || b.maxLoan}</b></div>
              <div className="flex justify-between"><span className="text-slate-400">Kỳ hạn</span><b className="text-slate-700 dark:text-slate-200">{b.term}</b></div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addBank} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Thêm ngân hàng</button>
    </div>
  );

  const renderExport = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg text-white">
        <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">EXPORT</span>
        <h2 className="text-base sm:text-lg font-black text-emerald-400 mt-1 flex items-center gap-2"><Share2 className="w-5 h-5" /> XUẤT DỮ LIỆU BẢNG HÀNG</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={exportJSON} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-6 text-center space-y-3 hover:border-emerald-500/50 transition cursor-pointer">
          <Download className="w-10 h-10 text-emerald-400 mx-auto" />
          <div className="font-black text-sm text-slate-800 dark:text-white">Export JSON</div>
          <div className="text-[10px] text-slate-400">Toàn bộ dữ liệu: căn, đại lý F1, chính sách, đợt thanh toán, ngân hàng, sơ đồ</div>
        </button>
        <button onClick={exportCSV} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-6 text-center space-y-3 hover:border-emerald-500/50 transition cursor-pointer">
          <FileSpreadsheet className="w-10 h-10 text-sky-400 mx-auto" />
          <div className="font-black text-sm text-slate-800 dark:text-white">Export CSV</div>
          <div className="text-[10px] text-slate-400">Bảng hàng dạng bảng tính — mở được bằng Excel / Google Sheets</div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs text-slate-400 mt-3 font-bold">Đang tải bảng hàng...</p>
        </div>
      ) : (
        <>
          {subTab === 'matbang' && renderMatBang()}
          {subTab === 'dashboard' && renderDashboard()}
          {subTab === 'import' && renderImport()}
          {subTab === 'sodo' && renderSodo()}
          {subTab === 'danhsach' && renderDanhSach()}
          {subTab === 'chinhsach' && renderChinhSach()}
          {subTab === 'dottt' && renderDotTT()}
          {subTab === 'nganhang' && renderNganHang()}
          {subTab === 'export' && renderExport()}
        </>
      )}

      {renderUnitModal()}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[110] bg-slate-900 border border-emerald-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
};