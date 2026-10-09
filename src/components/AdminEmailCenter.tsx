import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, MailOpen, Inbox, Send, RefreshCw, ShieldCheck, AlertCircle,
  CheckCircle2, XCircle, Link2, Loader2, Server, Megaphone, Reply, Trash2
} from 'lucide-react';

type EmailTab = 'status' | 'inbox' | 'sent' | 'compose';

interface DnsRecord {
  record: string;
  type: string;
  name: string;
  value: string;
  status: string;
  priority?: number | string;
  ttl?: string;
}

interface SentEmail {
  id: string;
  to?: string[] | string;
  from?: string;
  subject?: string;
  created_at?: string;
  last_event?: string;
}

interface ReceivedEmail {
  id: string;
  to?: string[] | string;
  from?: string;
  subject?: string;
  created_at?: string;
  [k: string]: any;
}

interface ApiState<T> { loading: boolean; error: string; data: T | null; }

const fmtDate = (s?: string) => {
  if (!s) return '—';
  try { return new Date(s).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }); } catch { return s; }
};

const StatusPill: React.FC<{ status?: string }> = ({ status }) => {
  const s = (status || '').toLowerCase();
  const map: Record<string, string> = {
    verified: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    delivered: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    opened: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    clicked: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30',
    pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    sent: 'bg-sky-500/15 text-sky-500 border-sky-500/30',
    bounced: 'bg-red-500/15 text-red-500 border-red-500/30',
    complained: 'bg-red-500/15 text-red-500 border-red-500/30',
    failed: 'bg-red-500/15 text-red-500 border-red-500/30',
  };
  const cls = map[s] || 'bg-slate-500/15 text-slate-500 border-slate-500/30';
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cls}`}>{status || 'unknown'}</span>;
};

export const AdminEmailCenter: React.FC = () => {
  const [tab, setTab] = useState<EmailTab>('status');

  const [status, setStatus] = useState<ApiState<any>>({ loading: false, error: '', data: null });
  const [inbox, setInbox] = useState<ApiState<ReceivedEmail[]>>({ loading: false, error: '', data: null });
  const [sent, setSent] = useState<ApiState<SentEmail[]>>({ loading: false, error: '', data: null });
  const [opened, setOpened] = useState<any | null>(null);
  const [openedLoading, setOpenedLoading] = useState(false);

  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  // Soạn / broadcast
  const [cTo, setCTo] = useState('');
  const [cSubject, setCSubject] = useState('');
  const [cBody, setCBody] = useState('');
  const [broadcast, setBroadcast] = useState(false);
  const [audience, setAudience] = useState<'all' | 'user' | 'admin'>('user');
  const [sending, setSending] = useState(false);

  const flash = (kind: 'ok' | 'err', msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const call = useCallback(async (url: string, init?: RequestInit) => {
    const res = await fetch(url, init);
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.ok === false) {
      throw new Error(json?.error || `HTTP ${res.status}`);
    }
    return json;
  }, []);

  const loadStatus = useCallback(async () => {
    setStatus((s) => ({ ...s, loading: true, error: '' }));
    try {
      const json = await call('/api/admin/email/status');
      setStatus({ loading: false, error: '', data: json.domain });
    } catch (e: any) {
      setStatus({ loading: false, error: e.message, data: null });
    }
  }, [call]);

  const loadInbox = useCallback(async () => {
    setInbox((s) => ({ ...s, loading: true, error: '' }));
    try {
      const json = await call('/api/admin/email/inbox?limit=50');
      setInbox({ loading: false, error: '', data: json.emails || [] });
    } catch (e: any) {
      setInbox({ loading: false, error: e.message, data: null });
    }
  }, [call]);

  const loadSent = useCallback(async () => {
    setSent((s) => ({ ...s, loading: true, error: '' }));
    try {
      const json = await call('/api/admin/email/logs?limit=50');
      setSent({ loading: false, error: '', data: json.emails || [] });
    } catch (e: any) {
      setSent({ loading: false, error: e.message, data: null });
    }
  }, [call]);

  useEffect(() => {
    if (tab === 'status' && !status.data && !status.loading) loadStatus();
    if (tab === 'inbox' && !inbox.data && !inbox.loading) loadInbox();
    if (tab === 'sent' && !sent.data && !sent.loading) loadSent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleVerify = async () => {
    flash('ok', 'Đang gửi yêu cầu verify tới Resend...');
    try {
      await call('/api/admin/email/verify', { method: 'POST' });
      await loadStatus();
      flash('ok', 'Đã gửi yêu cầu verify. Nếu DNS đã đúng, trạng thái sẽ chuyển "verified".');
    } catch (e: any) {
      flash('err', `Verify lỗi: ${e.message}`);
    }
  };

  const openInboxEmail = async (id: string) => {
    setOpenedLoading(true);
    setOpened({ id });
    try {
      const json = await call(`/api/admin/email/inbox/${encodeURIComponent(id)}`);
      setOpened({ id, ...json.email });
    } catch (e: any) {
      flash('err', `Không đọc được email: ${e.message}`);
      setOpened(null);
    } finally {
      setOpenedLoading(false);
    }
  };

  const handleSend = async () => {
    if (!cSubject.trim()) { flash('err', 'Chưa nhập tiêu đề.'); return; }
    if (broadcast) {
      setSending(true);
      try {
        const json = await call('/api/admin/email/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: cSubject, html: cBody, audience }),
        });
        flash('ok', `Đã gửi ${json.sent}/${json.total} email tới nhóm "${audience}".`);
        setCSubject(''); setCBody('');
      } catch (e: any) {
        flash('err', `Gửi hàng loạt lỗi: ${e.message}`);
      } finally {
        setSending(false);
      }
      return;
    }
    if (!cTo.trim()) { flash('err', 'Chưa nhập người nhận.'); return; }
    setSending(true);
    try {
      await call('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: cTo, subject: cSubject, html: cBody, replyTo: opened?.from }),
      });
      flash('ok', `Đã gửi email tới ${cTo}.`);
      setCTo(''); setCSubject(''); setCBody('');
    } catch (e: any) {
      flash('err', `Gửi lỗi: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  const replyTo = (email: any) => {
    const fromAddr = typeof email.from === 'string' ? email.from : (email.from?.address || '');
    setCTo(fromAddr);
    setCSubject(email.subject ? `Re: ${email.subject}` : 'Re:');
    setCBody(`\n\n--- Trả lời email ---\n${email.text || ''}`);
    setTab('compose');
  };

  const tabBtn = (id: EmailTab, label: string, Icon: any) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
        tab === id ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-500/40 p-5 sm:p-7 space-y-5 shadow-2xl text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/30">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-amber-500/30">
                Resend · chocudan24h.com
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mt-1">
              Trung tâm Email — Gửi &amp; Nhận
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabBtn('status', 'Trạng thái tên miền', Server)}
        {tabBtn('inbox', 'Hộp thư đến', Inbox)}
        {tabBtn('sent', 'Đã gửi', Send)}
        {tabBtn('compose', 'Soạn / Gửi', Megaphone)}
      </div>

      {toast && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          toast.kind === 'ok' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
            : 'bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/30'
        }`}>
          {toast.kind === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ===== STATUS ===== */}
      {tab === 'status' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">Trạng thái xác minh tên miền và các bản ghi DNS cần thêm.</p>
            <button onClick={handleVerify} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Verify lại
            </button>
          </div>
          {status.loading && <div className="text-xs text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Đang tải...</div>}
          {status.error && <div className="text-xs text-red-500">Lỗi: {status.error}</div>}
          {status.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Tên miền</p>
                  <p className="font-black text-sm truncate">{status.data.name}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Trạng thái</p>
                  <StatusPill status={status.data.status} />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Gửi</p>
                  <p className="font-bold text-xs">{status.data.capabilities?.sending || '—'}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Nhận</p>
                  <p className="font-bold text-xs">{status.data.capabilities?.receiving || '—'}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="p-2 font-bold">Loại</th>
                      <th className="p-2 font-bold">Tên</th>
                      <th className="p-2 font-bold">Giá trị</th>
                      <th className="p-2 font-bold">Ưu tiên</th>
                      <th className="p-2 font-bold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(status.data.records || []).map((r: DnsRecord, i: number) => (
                      <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="p-2 font-bold whitespace-nowrap">{r.type}</td>
                        <td className="p-2 font-mono whitespace-nowrap">{r.name || '@'}.chocudan24h.com</td>
                        <td className="p-2 font-mono max-w-[280px] truncate" title={r.value}>{r.value}</td>
                        <td className="p-2">{r.priority ?? '—'}</td>
                        <td className="p-2"><StatusPill status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400">Email gửi đi: <b>{status.data.emailFrom || '—'}</b></p>
            </div>
          )}
        </div>
      )}

      {/* ===== INBOX ===== */}
      {tab === 'inbox' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">Email khách hàng gửi tới @chocudan24h.com.</p>
            <button onClick={loadInbox} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${inbox.loading ? 'animate-spin' : ''}`} /> Tải lại
            </button>
          </div>
          {inbox.error && <div className="text-xs text-red-500">Lỗi: {inbox.error}</div>}
          {inbox.data && inbox.data.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Chưa có email nào. Hãy chắc chắn bản ghi <b>MX</b> đã được thêm và verify.
            </div>
          )}
          <div className="space-y-2">
            {(inbox.data || []).map((m) => (
              <button
                key={m.id}
                onClick={() => openInboxEmail(m.id)}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/5 transition flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                  <MailOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">{m.subject || '(không tiêu đề)'}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    Từ: {typeof m.from === 'string' ? m.from : (m.from?.address || '—')} · {fmtDate(m.created_at)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== SENT ===== */}
      {tab === 'sent' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">Lịch sử email hệ thống đã gửi đi (OTP, thông báo, marketing...).</p>
            <button onClick={loadSent} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${sent.loading ? 'animate-spin' : ''}`} /> Tải lại
            </button>
          </div>
          {sent.error && <div className="text-xs text-red-500">Lỗi: {sent.error}</div>}
          {sent.data && sent.data.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">Chưa có email gửi đi.</div>
          )}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            {sent.data && sent.data.length > 0 && (
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="p-2 font-bold">Người nhận</th>
                    <th className="p-2 font-bold">Tiêu đề</th>
                    <th className="p-2 font-bold">Trạng thái</th>
                    <th className="p-2 font-bold">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {sent.data.map((e) => (
                    <tr key={e.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-mono truncate max-w-[160px]">{Array.isArray(e.to) ? e.to.join(', ') : e.to}</td>
                      <td className="p-2 truncate max-w-[280px]" title={e.subject}>{e.subject}</td>
                      <td className="p-2"><StatusPill status={e.last_event} /></td>
                      <td className="p-2 whitespace-nowrap text-slate-400">{fmtDate(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ===== COMPOSE ===== */}
      {tab === 'compose' && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
            <input type="checkbox" checked={broadcast} onChange={(e) => setBroadcast(e.target.checked)} className="w-4 h-4 accent-amber-500" />
            Gửi hàng loạt cho danh sách người dùng (Broadcast)
          </label>

          {broadcast ? (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Nhóm người nhận</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value as any)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <option value="user">Tất cả người dùng (role: user)</option>
                <option value="admin">Quản trị viên</option>
                <option value="all">Tất cả tài khoản</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Người nhận (email, cách nhau dấu phẩy)</label>
              <input value={cTo} onChange={(e) => setCTo(e.target.value)} placeholder="khachhang@gmail.com" className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Tiêu đề</label>
            <input value={cSubject} onChange={(e) => setCSubject(e.target.value)} placeholder="[Chợ Cư Dân 24h] Thông báo..." className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase">Nội dung (hỗ trợ HTML)</label>
            <textarea value={cBody} onChange={(e) => setCBody(e.target.value)} rows={7} placeholder="<p>Xin chào...</p>" className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono" />
          </div>

          <button onClick={handleSend} disabled={sending} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 uppercase tracking-wider">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {broadcast ? 'Gửi hàng loạt' : 'Gửi email'}
          </button>
        </div>
      )}

      {/* ===== EMAIL DETAIL MODAL ===== */}
      {opened && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpened(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-black text-sm truncate">{opened.subject || '(không tiêu đề)'}</h4>
                <p className="text-[11px] text-slate-400">
                  Từ: {typeof opened.from === 'string' ? opened.from : (opened.from?.address || '—')} · {fmtDate(opened.created_at)}
                </p>
              </div>
              <button onClick={() => setOpened(null)} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            {openedLoading ? (
              <div className="text-xs text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Đang tải nội dung...</div>
            ) : opened.html ? (
              <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: opened.html }} />
            ) : (
              <pre className="text-xs whitespace-pre-wrap font-sans">{opened.text || '(không có nội dung)'}</pre>
            )}
            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => replyTo(opened)} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2">
                <Reply className="w-4 h-4" /> Trả lời
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailCenter;
