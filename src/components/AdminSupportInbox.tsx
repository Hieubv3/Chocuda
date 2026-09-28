import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Send, RefreshCw, Loader2, ShieldCheck, Clock, User as UserIcon, Search
} from 'lucide-react';

/**
 * HỘP THƯ CHAT NỘI BỘ — Admin xem & trả lời toàn bộ hội thoại
 * "Chat nội bộ" của cư dân (dịch vụ cư dân...). Dữ liệu nằm trong hệ thống,
 * KHÔNG chuyển hướng ra Zalo/ứng dụng ngoài.
 */

interface Msg {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  threadId?: string;
  threadTitle?: string;
  serviceId?: string;
  serviceName?: string;
  storeId?: string;
  content: string;
  createdAt: string;
  read?: boolean;
}

interface Thread {
  key: string;
  partnerId: string;
  partnerName: string;
  title: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  messages: Msg[];
}

export const AdminSupportInbox: React.FC = () => {
  const [allMsgs, setAllMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const token = localStorage.getItem('chocudan24h_token');
      const res = await fetch('/api/messages', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAllMsgs(data);
      }
    } catch (err) {
      console.warn('[AdminSupportInbox] load error:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
    const t = setInterval(() => load(false), 10000);
    return () => clearInterval(t);
  }, [load]);

  // Gom tin nhắn thành các hội thoại
  const threads: Thread[] = (() => {
    const map = new Map<string, Thread>();
    for (const m of allMsgs) {
      const partnerId = m.senderId === 'user-admin' ? m.receiverId : m.senderId;
      if (!partnerId || partnerId === 'ALL') continue;
      const key = m.threadId || `${m.serviceId || m.storeId || 'general'}-${partnerId}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          partnerId,
          partnerName: m.senderId === 'user-admin' ? m.receiverName : m.senderName,
          title: m.threadTitle || m.serviceName || (m.storeId ? `Gian hàng ${m.storeId}` : 'Hội thoại'),
          lastMessage: '',
          lastAt: '',
          unread: 0,
          messages: []
        });
      }
      const th = map.get(key)!;
      th.messages.push(m);
      if (m.senderId !== 'user-admin') th.partnerName = m.senderName || th.partnerName;
      if (m.threadTitle) th.title = m.threadTitle;
      else if (m.serviceName) th.title = `Dịch vụ: ${m.serviceName}`;
    }
    const list = Array.from(map.values());
    for (const th of list) {
      th.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const last = th.messages[th.messages.length - 1];
      th.lastMessage = last?.content || '';
      th.lastAt = last?.createdAt || '';
      th.unread = th.messages.filter(m => !m.read && m.senderId !== 'user-admin').length;
    }
    return list.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  })();

  const filteredThreads = (() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(t =>
      t.partnerName.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.lastMessage.toLowerCase().includes(q) ||
      // Tra lịch sử chat: tìm trong TOÀN BỘ nội dung tin nhắn của hội thoại
      t.messages.some(m => (m.content || '').toLowerCase().includes(q))
    );
  })();

  const selected = threads.find(t => t.key === selectedKey) || null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedKey, selected?.messages.length]);

  const handleReply = async () => {
    const text = replyText.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    try {
      const last = selected.messages[selected.messages.length - 1];
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'user-admin',
          senderName: 'BQT Chợ Cư Dân 24h',
          receiverId: selected.partnerId,
          receiverName: selected.partnerName,
          threadId: selected.key,
          threadTitle: selected.title,
          serviceId: last?.serviceId,
          serviceName: last?.serviceName,
          storeId: last?.storeId,
          content: text
        })
      });
      if (res.ok) {
        setReplyText('');
        await load(false);
      } else {
        alert('Gửi trả lời thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      alert('Không thể kết nối máy chủ.');
    } finally {
      setSending(false);
    }
  };

  const markRead = async (id: string) => {
    try { await fetch(`/api/messages/${id}/read`, { method: 'POST' }); } catch { /* ignore */ }
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">Hộp Thư Chat Nội Bộ</h3>
          <span className="text-[11px] text-slate-500">({threads.length} hội thoại)</span>
        </div>
        <button
          onClick={() => load(true)}
          className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition cursor-pointer"
          title="Làm mới"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[600px]">
        {/* Thread list */}
        <div className="border-r border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
          <div className="p-2.5 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, dịch vụ hoặc nội dung tin nhắn..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && filteredThreads.length === 0 && (
              <div className="py-10 text-center">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
              </div>
            )}
            {!loading && filteredThreads.length === 0 && (
              <p className="py-10 text-center text-xs text-slate-400">Chưa có hội thoại nào.</p>
            )}
            {filteredThreads.map(th => (
              <button
                key={th.key}
                onClick={() => { setSelectedKey(th.key); th.messages.filter(m => !m.read).forEach(m => markRead(m.id)); }}
                className={`w-full text-left p-3 border-b border-slate-100 dark:border-slate-700/60 transition cursor-pointer ${
                  selectedKey === th.key ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {th.partnerName}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {(() => { try { return new Date(th.lastAt).toLocaleDateString('vi-VN'); } catch { return ''; } })()}
                  </span>
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate mt-0.5">{th.title}</div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-[11px] text-slate-500 truncate">{th.lastMessage}</span>
                  {th.unread > 0 && (
                    <span className="shrink-0 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {th.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className="flex flex-col min-h-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div>
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">Chọn một hội thoại để xem & trả lời</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-slate-900 dark:text-white">{selected.partnerName}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-[11px] text-slate-500">{selected.title}</div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/40">
                {selected.messages.map(m => {
                  const isAdmin = m.senderId === 'user-admin';
                  return (
                    <div key={m.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} space-y-1`}>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold px-1">
                        <span>{isAdmin ? 'BQT Chợ Cư Dân' : m.senderName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {(() => { try { return new Date(m.createdAt).toLocaleString('vi-VN'); } catch { return ''; } })()}
                        </span>
                      </div>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        isAdmin
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  placeholder="Nhập trả lời cho cư dân..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>GỬI</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
